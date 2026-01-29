'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { RFPItemWithMatches, MatchSuggestion } from '@/types/rfp'

export interface ActionResult {
  success: boolean
  error?: string
  updatedItem?: RFPItemWithMatches
}

/**
 * Helper function to fetch an RFP item with its match suggestions.
 * Used to return updated data after mutations for optimistic UI updates.
 * Enriches match suggestions with descricao_comercial from artigos table.
 */
async function fetchItemWithMatches(
  supabase: SupabaseClient,
  rfpItemId: string
): Promise<RFPItemWithMatches | null> {
  const { data, error } = await supabase
    .from('rfp_items')
    .select(`
      *,
      rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (*)
    `)
    .eq('id', rfpItemId)
    .single()

  if (error || !data) {
    console.error('Failed to fetch updated item:', error)
    return null
  }

  // Enrich match suggestions with descricao_comercial from artigos table
  const enrichedMatches = await Promise.all(
    (data.rfp_match_suggestions || []).map(async (match: MatchSuggestion) => {
      // Skip if no artigo code to join on
      if (!match.artigo) return match

      // Fetch descricao_comercial from artigos table
      const { data: artigoData } = await supabase
        .from('artigos')
        .select('descricao_comercial')
        .eq('artigo', match.artigo)
        .maybeSingle()

      return {
        ...match,
        descricao_comercial: artigoData?.descricao_comercial ?? null,
      }
    })
  )

  // Sort match suggestions by similarity_score DESC
  return {
    ...data,
    rfp_match_suggestions: enrichedMatches.sort(
      (a: MatchSuggestion, b: MatchSuggestion) => b.similarity_score - a.similarity_score
    ),
  } as RFPItemWithMatches
}

/**
 * Helper function to update last_edited_by on the RFP job.
 * Called after any match action to track who made the most recent change.
 */
async function updateLastEditedBy(
  supabase: SupabaseClient,
  jobId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('rfp_upload_jobs')
    .update({ last_edited_by: userId })
    .eq('id', jobId)
}

export interface InventorySearchResult {
  id: string
  codigo_spms: string | null
  artigo: string | null
  descricao: string | null
  unidade_venda: string | null
  preco: number | null
}

/**
 * Accept a match suggestion for an RFP item.
 * - Sets the selected match's status to 'accepted'
 * - Auto-rejects all other matches for the same RFP item
 * - Updates the RFP item's review_status to 'accepted' and sets selected_match_id
 */
export async function acceptMatch(
  jobId: string,
  rfpItemId: string,
  matchId: string
): Promise<ActionResult> {
  try {
    console.log('[acceptMatch] Starting...', { jobId, rfpItemId, matchId })
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      console.log('[acceptMatch] Not authenticated')
      return { success: false, error: 'Not authenticated' }
    }
    console.log('[acceptMatch] Authenticated as:', user.id)

    // Step 1: Accept the selected match
    const { data: matchData, error: matchError, count: matchCount } = await supabase
      .from('rfp_match_suggestions')
      .update({ status: 'accepted' })
      .eq('id', matchId)
      .select()

    console.log('[acceptMatch] Step 1 - Update match:', { matchData, matchError, matchCount })

    if (matchError) {
      console.log('[acceptMatch] Match update error:', matchError)
      return { success: false, error: matchError.message }
    }

    // Step 2: Reject all other matches for this RFP item (auto-reject siblings)
    const { error: rejectError } = await supabase
      .from('rfp_match_suggestions')
      .update({ status: 'rejected' })
      .eq('rfp_item_id', rfpItemId)
      .neq('id', matchId)

    if (rejectError) {
      console.error('Failed to reject other matches:', rejectError)
      // Non-fatal: continue
    }

    // Step 3: Update the RFP item's review_status and selected_match_id
    const { data: itemData, error: itemError } = await supabase
      .from('rfp_items')
      .update({
        review_status: 'accepted',
        selected_match_id: matchId,
      })
      .eq('id', rfpItemId)
      .select()

    console.log('[acceptMatch] Step 3 - Update item:', { itemData, itemError })

    if (itemError) {
      console.log('[acceptMatch] Item update error:', itemError)
      return { success: false, error: itemError.message }
    }

    // Step 4: Track who made this change
    await updateLastEditedBy(supabase, jobId, user.id)

    // Step 5: Fetch and return the updated item for optimistic UI update
    const updatedItem = await fetchItemWithMatches(supabase, rfpItemId)

    // Invalidate cache to refresh page data
    revalidatePath(`/rfps/${jobId}/matches`)

    console.log('[acceptMatch] Complete - success')
    return { success: true, updatedItem: updatedItem ?? undefined }
  } catch (error) {
    console.error('acceptMatch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Unselect (toggle off) an accepted or rejected match suggestion.
 * - For manual matches: DELETE the match (it was user-created and might be an error)
 * - For regular matches: Sets only this specific match's status back to 'pending'
 * - Other matches remain unchanged (keeps their accepted/rejected/pending status)
 * - Resets the RFP item's review_status to 'pending' and clears selected_match_id
 */
export async function unselectMatch(
  jobId: string,
  rfpItemId: string,
  matchId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 0: Check if this is a manual match
    const { data: matchData } = await supabase
      .from('rfp_match_suggestions')
      .select('match_type')
      .eq('id', matchId)
      .single()

    const isManualMatch = matchData?.match_type === 'Manual'

    if (isManualMatch) {
      // For manual matches: DELETE the match entirely (user-created, might be an error)
      const { error: deleteError } = await supabase
        .from('rfp_match_suggestions')
        .delete()
        .eq('id', matchId)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }
    } else {
      // For regular matches: Set only this specific match to 'pending'
      const { error: matchError } = await supabase
        .from('rfp_match_suggestions')
        .update({ status: 'pending' })
        .eq('id', matchId)

      if (matchError) {
        return { success: false, error: matchError.message }
      }
    }

    // Step 2: Reset the RFP item's review_status and clear selected_match_id
    const { error: itemError } = await supabase
      .from('rfp_items')
      .update({
        review_status: 'pending',
        selected_match_id: null,
      })
      .eq('id', rfpItemId)

    if (itemError) {
      return { success: false, error: itemError.message }
    }

    // Step 3: Track who made this change
    await updateLastEditedBy(supabase, jobId, user.id)

    // Step 4: Fetch and return the updated item for optimistic UI update
    const updatedItem = await fetchItemWithMatches(supabase, rfpItemId)

    // Invalidate cache to refresh page data
    revalidatePath(`/rfps/${jobId}/matches`)

    return { success: true, updatedItem: updatedItem ?? undefined }
  } catch (error) {
    console.error('unselectMatch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Reject a match suggestion for an RFP item.
 * - Sets this specific match's status to 'rejected'
 * - If no non-rejected matches remain, marks the RFP item as 'rejected'
 * - If this was the accepted match, clears the selected_match_id and sets status to 'pending'
 */
export async function rejectMatch(
  jobId: string,
  rfpItemId: string,
  matchId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Reject the specific match
    const { error: matchError } = await supabase
      .from('rfp_match_suggestions')
      .update({ status: 'rejected' })
      .eq('id', matchId)

    if (matchError) {
      return { success: false, error: matchError.message }
    }

    // Step 2: Check if any non-rejected matches remain
    const { data: remainingMatches } = await supabase
      .from('rfp_match_suggestions')
      .select('id')
      .eq('rfp_item_id', rfpItemId)
      .neq('status', 'rejected')

    // Step 3: Check if this was the currently accepted match
    const { data: currentItem } = await supabase
      .from('rfp_items')
      .select('selected_match_id')
      .eq('id', rfpItemId)
      .single()

    // Step 4: Update RFP item based on remaining matches
    if (!remainingMatches || remainingMatches.length === 0) {
      // No remaining matches - mark item as rejected
      const { error: itemError } = await supabase
        .from('rfp_items')
        .update({
          review_status: 'rejected',
          selected_match_id: null,
        })
        .eq('id', rfpItemId)

      if (itemError) {
        return { success: false, error: itemError.message }
      }
    } else if (currentItem?.selected_match_id === matchId) {
      // This was the accepted match - reset to pending
      const { error: itemError } = await supabase
        .from('rfp_items')
        .update({
          review_status: 'pending',
          selected_match_id: null,
        })
        .eq('id', rfpItemId)

      if (itemError) {
        return { success: false, error: itemError.message }
      }
    }

    // Track who made this change
    await updateLastEditedBy(supabase, jobId, user.id)

    // Fetch and return the updated item for optimistic UI update
    const updatedItem = await fetchItemWithMatches(supabase, rfpItemId)

    // Invalidate cache to refresh page data
    revalidatePath(`/rfps/${jobId}/matches`)

    return { success: true, updatedItem: updatedItem ?? undefined }
  } catch (error) {
    console.error('rejectMatch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Search inventory items by codigo_spms, artigo, or descricao.
 * Used for manual match selection when AI suggestions are wrong or missing.
 */
export async function searchInventory(
  query: string
): Promise<InventorySearchResult[]> {
  try {
    // Return early if query is too short
    if (!query || query.length < 2) {
      return []
    }

    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return []
    }

    // Search across codigo_spms, artigo, and descricao with case-insensitive matching
    const searchPattern = `%${query}%`
    const { data, error } = await supabase
      .from('artigos')
      .select('id, codigo_spms, artigo, descricao, unidade_venda, preco')
      .or(
        `codigo_spms.ilike.${searchPattern},artigo.ilike.${searchPattern},descricao.ilike.${searchPattern}`
      )
      .limit(50)

    if (error) {
      console.error('searchInventory error:', error)
      return []
    }

    return data as InventorySearchResult[]
  } catch (error) {
    console.error('searchInventory error:', error)
    return []
  }
}

/**
 * Auto-accept exact matches (100% similarity) for all pending items in a job.
 * Called on page load to pre-confirm obvious matches.
 * Returns the count of auto-accepted items.
 */
export async function autoAcceptExactMatches(
  jobId: string
): Promise<{ accepted: number; error?: string }> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { accepted: 0, error: 'Not authenticated' }
    }

    // Find all pending RFP items for this job
    const { data: items, error: fetchError } = await supabase
      .from('rfp_items')
      .select(
        `
        id,
        rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (
          id,
          similarity_score
        )
      `
      )
      .eq('job_id', jobId)
      .eq('review_status', 'pending')

    if (fetchError) {
      console.error('autoAcceptExactMatches fetch error:', fetchError)
      return { accepted: 0, error: fetchError.message }
    }

    let accepted = 0

    for (const item of items ?? []) {
      // Find a match with 100% similarity (>= 0.9999 to handle floating point)
      const exactMatch = (
        item.rfp_match_suggestions as { id: string; similarity_score: number }[]
      )?.find((m) => m.similarity_score >= 0.9999)

      if (exactMatch) {
        // Accept the exact match using the same logic as acceptMatch
        // Step 1: Accept the selected match
        await supabase
          .from('rfp_match_suggestions')
          .update({ status: 'accepted' })
          .eq('id', exactMatch.id)

        // Step 2: Reject all other matches for this RFP item
        await supabase
          .from('rfp_match_suggestions')
          .update({ status: 'rejected' })
          .eq('rfp_item_id', item.id)
          .neq('id', exactMatch.id)

        // Step 3: Update the RFP item's review_status and selected_match_id
        await supabase
          .from('rfp_items')
          .update({
            review_status: 'accepted',
            selected_match_id: exactMatch.id,
          })
          .eq('id', item.id)

        accepted++
      }
    }

    // Note: No revalidatePath here since this function is called during server component render.
    // The page will display fresh data after this function returns since it fetches data afterward.

    return { accepted }
  } catch (error) {
    console.error('autoAcceptExactMatches error:', error)
    return {
      accepted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Set a manual match for an RFP item by creating a new match suggestion from an inventory item.
 * - Creates a new match suggestion with status 'accepted' and match_type 'Manual'
 * - Rejects all existing matches for this RFP item
 * - Updates the RFP item's review_status to 'manual' and sets selected_match_id
 */
export async function setManualMatch(
  jobId: string,
  rfpItemId: string,
  inventoryItem: InventorySearchResult
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Insert the new manual match suggestion
    const { data: newMatch, error: insertError } = await supabase
      .from('rfp_match_suggestions')
      .insert({
        rfp_item_id: rfpItemId,
        codigo_spms: inventoryItem.codigo_spms,
        artigo: inventoryItem.artigo,
        descricao: inventoryItem.descricao,
        unidade_venda: inventoryItem.unidade_venda,
        preco: inventoryItem.preco,
        similarity_score: 1.0, // Manual = 100% user confidence
        match_type: 'Manual',
        rank: 0, // Top priority
        status: 'accepted',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('setManualMatch insert error:', insertError)
      return { success: false, error: insertError.message }
    }

    // Step 2: Reject all other matches for this RFP item
    const { error: rejectError } = await supabase
      .from('rfp_match_suggestions')
      .update({ status: 'rejected' })
      .eq('rfp_item_id', rfpItemId)
      .neq('id', newMatch.id)

    if (rejectError) {
      console.error('Failed to reject other matches:', rejectError)
      // Non-fatal: continue
    }

    // Step 3: Update the RFP item's review_status and selected_match_id
    const { error: itemError } = await supabase
      .from('rfp_items')
      .update({
        review_status: 'manual',
        selected_match_id: newMatch.id,
      })
      .eq('id', rfpItemId)

    if (itemError) {
      return { success: false, error: itemError.message }
    }

    // Step 4: Track who made this change
    await updateLastEditedBy(supabase, jobId, user.id)

    // Step 5: Fetch and return the updated item for optimistic UI update
    const updatedItem = await fetchItemWithMatches(supabase, rfpItemId)

    // Invalidate cache to refresh page data
    revalidatePath(`/rfps/${jobId}/matches`)

    return { success: true, updatedItem: updatedItem ?? undefined }
  } catch (error) {
    console.error('setManualMatch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Confirm an RFP job, marking it as ready for export.
 * Sets the confirmed_at timestamp and tracks who confirmed it.
 */
export async function confirmRFP(jobId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('rfp_upload_jobs')
      .update({
        confirmed_at: new Date().toISOString(),
        last_edited_by: user.id,
      })
      .eq('id', jobId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Invalidate cache to refresh page data
    revalidatePath('/rfps')
    revalidatePath(`/rfps/${jobId}/matches`)

    return { success: true }
  } catch (error) {
    console.error('confirmRFP error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Revert confirmation of an RFP job.
 * Clears the confirmed_at timestamp to allow further editing.
 */
export async function revertConfirmation(jobId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('rfp_upload_jobs')
      .update({
        confirmed_at: null,
        last_edited_by: user.id,
      })
      .eq('id', jobId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Invalidate cache to refresh page data
    revalidatePath('/rfps')
    revalidatePath(`/rfps/${jobId}/matches`)

    return { success: true }
  } catch (error) {
    console.error('revertConfirmation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

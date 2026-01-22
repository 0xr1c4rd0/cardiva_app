'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ActionResult {
  success: boolean
  error?: string
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
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Accept the selected match
    const { error: matchError } = await supabase
      .from('rfp_match_suggestions')
      .update({ status: 'accepted' })
      .eq('id', matchId)

    if (matchError) {
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
    const { error: itemError } = await supabase
      .from('rfp_items')
      .update({
        review_status: 'accepted',
        selected_match_id: matchId,
      })
      .eq('id', rfpItemId)

    if (itemError) {
      return { success: false, error: itemError.message }
    }

    // Invalidate cache to refresh page data
    revalidatePath(`/rfps/${jobId}/matches`)

    return { success: true }
  } catch (error) {
    console.error('acceptMatch error:', error)
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

    // Invalidate cache to refresh page data
    revalidatePath(`/rfps/${jobId}/matches`)

    return { success: true }
  } catch (error) {
    console.error('rejectMatch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

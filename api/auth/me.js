// Current session. Logged out is a normal state, so it returns 200 { user: null } rather than an error.
import { route, timeZone } from '../_lib/http.js'
import { currentUserId, endSession } from '../_lib/auth.js'
import { loadProfile } from '../_lib/users.js'

export default route(['GET'], async (req, res) => {
  const userId = await currentUserId(req)
  if (!userId) return res.status(200).json({ user: null })
  const user = await loadProfile(userId, timeZone(req))
  if (!user) endSession(res) // account no longer exists
  res.status(200).json({ user })
})

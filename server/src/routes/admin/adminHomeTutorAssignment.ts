import { Router } from 'express'
import { z } from 'zod'
import { HomeTutorRequest } from '../../models/HomeTutorRequest.js'
import { Candidate } from '../../models/Candidate.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { NotFoundError } from '../../utils/HttpError.js'

export const adminHomeTutorAssignmentRouter = Router()
adminHomeTutorAssignmentRouter.use(requireAdmin, requirePermission('reviewSubmissions'))

const assignBodySchema = z.object({ candidateId: z.string().nullable() })

adminHomeTutorAssignmentRouter.patch(
  '/:id/assign',
  asyncHandler(async (req, res) => {
    const { candidateId } = assignBodySchema.parse(req.body)
    const request = await HomeTutorRequest.findById(req.params.id)
    if (!request) throw new NotFoundError('Request not found')

    if (candidateId) {
      const candidate = await Candidate.findOne({ _id: candidateId, status: 'Active' })
      if (!candidate) throw new NotFoundError('Candidate not found')
      request.assignedCandidateId = candidate._id
      request.assignedCandidateName = candidate.name
      logAction(req, 'assign-tutor', 'HomeTutorRequest', request.id, `Assigned ${candidate.name}`)
    } else {
      request.assignedCandidateId = undefined
      request.assignedCandidateName = undefined
      logAction(req, 'unassign-tutor', 'HomeTutorRequest', request.id)
    }

    await request.save()
    res.json(request)
  }),
)

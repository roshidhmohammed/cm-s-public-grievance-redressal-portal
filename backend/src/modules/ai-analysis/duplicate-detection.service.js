import Grievance from '../grievances/grievance.model.js';

export class DuplicateDetectionService {
  static async findCandidates(
    district,
    searchText,
    excludeGrievanceId,
  ) {
    const filter = {
      district,

      status: {
        $ne: "RESOLVED",
      },
    };

    if (excludeGrievanceId) {
      filter._id = {
        $ne: excludeGrievanceId,
      };
    }

    const candidates = await Grievance.find(filter)
      .select(
        "_id referenceNumber subject description",
      )
      .sort({
        createdAt: -1,
      })
      .limit(100)
      .lean();

    // This initial retrieval stage returns a bounded
    // set of same-district open complaints.
    // Semantic similarity ranking can be added next.

    return candidates
      .slice(0, 5)
      .map((grievance) => ({
        grievanceId: grievance._id.toString(),
        referenceNumber: grievance.referenceNumber,
        subject: grievance.subject,
        description: grievance.description.slice(
          0,
          1000,
        ),
      }));
  }
}
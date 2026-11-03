type PointsPackageId = "POINTS_100" | "POINTS_300" | "POINTS_1000"

export const parsePointsPackageId = (value: unknown): PointsPackageId | null => {
	if (value === "POINTS_100") return "POINTS_100"
	if (value === "POINTS_300") return "POINTS_300"
	if (value === "POINTS_1000") return "POINTS_1000"
	return null
}

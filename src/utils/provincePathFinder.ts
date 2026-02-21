import { provinces_data } from 'src/data/provinces_data'

/**
 * Normalize province name for matching
 * Handles variations like "Maputo Cidade" vs "Maputo (Cidade)" vs "Maputo Cidade"
 */
function normalizeProvinceName(name: string): string {
	if (!name) return ''
	// Handle Maputo Cidade variations
	if (name.includes('Maputo') && (name.includes('Cidade') || name.includes('Cidade'))) {
		return 'Maputo Cidade'
	}
	// Trim and normalize
	return name.trim()
}

/**
 * Find province data by name (with normalization)
 */
function findProvinceByName(name: string) {
	const normalized = normalizeProvinceName(name)
	return provinces_data.find(
		(p) =>
			normalizeProvinceName(p.name) === normalized ||
			p.initials === normalized ||
			p.code === normalized ||
			p.name === name,
	)
}

/**
 * Find the path of provinces between two provinces (by name or code)
 * Uses BFS to find the shortest path through neighboring provinces
 * Returns province codes for consistency
 */
export function findProvincePath(
	departureProvince: string,
	destinationProvince: string,
): { codes: string[]; names: string[] } {
	// Try to find provinces by name or code
	const departureProv = findProvinceByName(departureProvince)
	const destinationProv = findProvinceByName(destinationProvince)

	if (!departureProv || !destinationProv) {
		// If we can't find provinces, return both as-is
		return {
			codes: [departureProv?.code || departureProvince, destinationProv?.code || destinationProvince],
			names: [departureProvince, destinationProvince],
		}
	}

	if (departureProv.code === destinationProv.code) {
		return {
			codes: [departureProv.code],
			names: [departureProv.name],
		}
	}

	// BFS to find shortest path using province codes
	const queue: { code: string; path: string[] }[] = [{ code: departureProv.code, path: [departureProv.code] }]
	const visited = new Set<string>([departureProv.code])

	while (queue.length > 0) {
		const { code, path } = queue.shift()!

		const provinceData = provinces_data.find((p) => p.code === code)
		if (!provinceData || !provinceData.neighbors) {
			continue
		}

		for (const neighborName of provinceData.neighbors) {
			const neighborProv = findProvinceByName(neighborName)
			if (!neighborProv) continue

			const neighborCode = neighborProv.code

			if (neighborCode === destinationProv.code) {
				const fullPath = [...path, neighborCode]
				return {
					codes: fullPath,
					names: fullPath.map((c) => provinces_data.find((p) => p.code === c)?.name || c),
				}
			}

			if (!visited.has(neighborCode)) {
				visited.add(neighborCode)
				queue.push({ code: neighborCode, path: [...path, neighborCode] })
			}
		}
	}

	// If no path found, return both provinces
	return {
		codes: [departureProv.code, destinationProv.code],
		names: [departureProv.name, destinationProv.name],
	}
}

/**
 * Get relevant provinces for checkpoint filtering
 * Returns both codes and names for flexibility
 */
export function getRelevantProvinces(
	departureProvince: string,
	destinationProvince: string,
): { codes: string[]; names: string[] } {
	const path = findProvincePath(departureProvince, destinationProvince)
	return {
		codes: Array.from(new Set(path.codes)),
		names: Array.from(new Set(path.names)),
	}
}

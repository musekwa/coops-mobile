import { Graph } from "src/constants/graphs"


export function findAllPaths(graph: Graph, start: string, end: string): string[][] {
	const allPaths: string[][] = []
	// get all paths
	dfs(graph, start, end, [], allPaths, new Set())
	// sort the paths by length
	return allPaths.length > 0 ? allPaths.sort((a, b) => a.length - b.length) : [[start, end]]
}

function dfs(
	graph: Graph,
	current: string,
	destination: string,
	path: string[],
	allPaths: string[][],
	visited: Set<string>,
) {
	visited.add(current)
	path.push(current)

	if (current === destination) {
		allPaths.push([...path])
		// Early exit if a path to the destination is found
		visited.delete(current)
		path.pop()
		return
	} else if (graph[current]) {
		for (const neighbor of graph[current]) {
			// Prune paths that are unlikely to lead to the destination
			if (!visited.has(neighbor) && (graph[neighbor]?.includes(destination) || graph[neighbor]?.length > 0)) {
				dfs(graph, neighbor, destination, path, allPaths, visited)
			}
		}
	}

	path.pop()
	visited.delete(current)
}

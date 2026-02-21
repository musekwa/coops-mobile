# Shipment Checkpoint Path Finder

This utility provides functionality to find all possible paths through checkpoints for shipments from departure to destination districts.

## Overview

The system analyzes the `SHIPMENT_CHECKPOINTS` table to find all possible routes a shipment must take through inspection checkpoints before reaching its destination. Each checkpoint can have connections to other checkpoints in four directions: north, south, east, and west.

## Database Schema

### SHIPMENT_CHECKPOINTS Table
- `id`: Unique identifier for the checkpoint
- `name`: Name of the checkpoint
- `checkpoint_type`: Type of checkpoint (INTERNATIONAL, INTERPROVINCIAL, INTERDISTRITAL, INTRADISTRICTAL)
- `address_id`: Reference to the ADDRESSES table
- `southern_next_checkpoint_id`: ID of the next checkpoint to the south
- `northern_next_checkpoint_id`: ID of the next checkpoint to the north
- `eastern_next_checkpoint_id`: ID of the next checkpoint to the east
- `western_next_checkpoint_id`: ID of the next checkpoint to the west

### SHIPMENT_DIRECTIONS Table
- `shipment_id`: Reference to the shipment
- `departure_address_id`: Address ID of departure location
- `destination_address_id`: Address ID of destination location

## Usage

### Using the Hook

```typescript
import { useCheckpointPaths } from 'src/hooks/useCheckpointPaths'

function MyComponent({ shipmentId }: { shipmentId: string }) {
  const { paths, isLoading, error, isError } = useCheckpointPaths(shipmentId)
  
  if (isLoading) return <Text>Loading paths...</Text>
  if (isError) return <Text>Error: {error}</Text>
  
  return (
    <CheckpointPathsDisplay
      paths={paths}
      isLoading={isLoading}
      error={error}
      isError={isError}
      onPathSelect={(path, index) => console.log('Selected path:', path)}
    />
  )
}
```

### Using the Utility Functions Directly

```typescript
import { findAllCheckpointPaths, getShipmentCheckpointPaths } from 'src/utils/shipmentPathFinder'

// Find paths between specific districts
const paths = await findAllCheckpointPaths(
  departureDistrictId,
  destinationDistrictId,
  db
)

// Find paths for a specific shipment
const paths = await getShipmentCheckpointPaths(shipmentId, db)
```

## Path Structure

Each path contains:
- `path`: Array of district names representing the route
- `checkpointIds`: Array of checkpoint IDs along the route
- `checkpointDetails`: Detailed information about each checkpoint (name, type, location)

## Algorithm

The path finding algorithm uses a recursive depth-first search approach:

1. **Find departure and destination checkpoints**: Locate all checkpoints in the departure and destination districts
2. **Build checkpoint graph**: Create a graph representation of all checkpoints and their connections
3. **Find all paths**: For each departure-destination checkpoint pair, find all possible paths
4. **Avoid cycles**: Use a visited set to prevent infinite loops
5. **Return results**: Return all unique paths found

## Checkpoint Types

- **INTERNATIONAL**: Border checkpoints between countries
- **INTERPROVINCIAL**: Checkpoints between provinces
- **INTERDISTRITAL**: Checkpoints between districts
- **INTRADISTRICTAL**: Checkpoints within the same district

## Error Handling

The system handles various error scenarios:
- No shipment direction found
- No checkpoints in departure/destination districts
- Database connection errors
- Invalid checkpoint data

## Performance Considerations

- The algorithm uses memoization to avoid recalculating paths
- Database queries are optimized with proper indexing
- Large checkpoint networks are handled efficiently with cycle detection

## Integration

This utility is integrated into the `ShipmentVerticalStatusLine` component to display checkpoint paths in the shipment tracking interface. Users can:

1. View all possible routes for a shipment
2. See checkpoint details (name, type, location)
3. Select a preferred route
4. Expand/collapse route details

## Future Enhancements

- Add distance calculations between checkpoints
- Implement route optimization algorithms
- Add real-time checkpoint status updates
- Support for dynamic route changes based on conditions 
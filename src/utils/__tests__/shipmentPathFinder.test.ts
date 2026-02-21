import { findAllCheckpointPaths, CheckpointPath, CheckpointNode } from '../shipmentPathFinder'

// Mock database for testing
const mockDb = {
  getAll: jest.fn(),
  getFirst: jest.fn(),
  get: jest.fn(),
}

describe('Shipment Path Finder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findAllCheckpointPaths', () => {
    it('should find paths between checkpoints', async () => {
      // Mock checkpoint data
      const mockCheckpoints = [
        {
          id: 'cp1',
          name: 'Checkpoint A',
          checkpoint_type: 'INTERDISTRITAL',
          address_id: 'addr1',
          southern_next_checkpoint_id: 'cp2',
          northern_next_checkpoint_id: null,
          eastern_next_checkpoint_id: null,
          western_next_checkpoint_id: null,
          district_name: 'District A',
          province_name: 'Province A',
        },
        {
          id: 'cp2',
          name: 'Checkpoint B',
          checkpoint_type: 'INTERDISTRITAL',
          address_id: 'addr2',
          southern_next_checkpoint_id: null,
          northern_next_checkpoint_id: 'cp1',
          eastern_next_checkpoint_id: null,
          western_next_checkpoint_id: null,
          district_name: 'District B',
          province_name: 'Province B',
        },
      ]

      // Mock district check queries
      mockDb.getAll.mockResolvedValue(mockCheckpoints)
      mockDb.getFirst.mockResolvedValue({ count: 1 }) // Checkpoint is in district
      mockDb.get.mockResolvedValue({ name: 'Test District' })

      const paths = await findAllCheckpointPaths('district1', 'district2', mockDb)

      expect(paths).toBeDefined()
      expect(Array.isArray(paths)).toBe(true)
      expect(paths.length).toBeGreaterThan(0)
    })

    it('should handle no checkpoints found', async () => {
      mockDb.getAll.mockResolvedValue([])
      mockDb.getFirst.mockResolvedValue({ count: 0 })
      mockDb.get.mockResolvedValue({ name: 'Test District' })

      const paths = await findAllCheckpointPaths('district1', 'district2', mockDb)

      expect(paths).toBeDefined()
      expect(Array.isArray(paths)).toBe(true)
      expect(paths.length).toBe(1) // Should return direct path
      expect(paths[0].path).toEqual(['Test District', 'Test District'])
    })

    it('should handle database errors', async () => {
      mockDb.getAll.mockRejectedValue(new Error('Database error'))

      await expect(findAllCheckpointPaths('district1', 'district2', mockDb))
        .rejects
        .toThrow('Database error')
    })
  })

  describe('CheckpointNode interface', () => {
    it('should have correct structure', () => {
      const checkpointNode: CheckpointNode = {
        id: 'test-id',
        name: 'Test Checkpoint',
        districtName: 'Test District',
        provinceName: 'Test Province',
        checkpointType: 'INTERDISTRITAL',
        addressId: 'test-address',
        southernNextCheckpointId: 'next-south',
        northernNextCheckpointId: 'next-north',
        easternNextCheckpointId: 'next-east',
        westernNextCheckpointId: 'next-west',
      }

      expect(checkpointNode.id).toBe('test-id')
      expect(checkpointNode.name).toBe('Test Checkpoint')
      expect(checkpointNode.checkpointType).toBe('INTERDISTRITAL')
    })
  })

  describe('CheckpointPath interface', () => {
    it('should have correct structure', () => {
      const checkpointPath: CheckpointPath = {
        path: ['District A', 'District B'],
        checkpointIds: ['cp1', 'cp2'],
        totalDistance: 100,
      }

      expect(checkpointPath.path).toEqual(['District A', 'District B'])
      expect(checkpointPath.checkpointIds).toEqual(['cp1', 'cp2'])
      expect(checkpointPath.totalDistance).toBe(100)
    })
  })
}) 
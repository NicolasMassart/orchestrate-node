import { utils } from 'ethers'

import { contractregistry } from '../../stubs'

import { ContractRegistry } from './ContractRegistry'

const mockRPCClient = {
  makeUnaryRequest: jest.fn()
}

jest.mock('@grpc/grpc-js', () => ({
  Client: jest.fn().mockImplementation(() => mockRPCClient),
  credentials: { createInsecure: jest.fn() }
}))

const mockABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
]
const mockBytecode = '0xfefe'
const mockDeployedBytecode = '0xdede'
const mockContractName = 'myContract'
const mockTag = 'tag'

describe('ContractRegistry', () => {
  let contractRegistry: ContractRegistry

  beforeEach(() => {
    contractRegistry = new ContractRegistry('endpoint:3000')
  })

  describe('register', () => {
    beforeEach(() => {
      mockUnaryRequest(contractregistry.RegisterContractResponse.encode({}).finish())
    })

    it('should register a new contract successfully', async () => {
      const request = {
        name: 'myContract',
        tag: '1',
        abi: mockABI,
        bytecode: mockBytecode,
        deployedBytecode: mockDeployedBytecode
      }

      const expectedRequestData = contractregistry.RegisterContractRequest.encode({
        contract: {
          id: {
            name: request.name,
            tag: request.tag
          },
          abi: utils.toUtf8Bytes(JSON.stringify(request.abi)),
          bytecode: utils.arrayify(request.bytecode),
          deployedBytecode: utils.arrayify(request.deployedBytecode)
        }
      }).finish()

      await contractRegistry.register(request)

      expectUnaryRequest('RegisterContract', expectedRequestData)
    })
  })

  describe('deregister', () => {
    beforeEach(() => {
      mockUnaryRequest(contractregistry.DeregisterContractResponse.encode({}).finish())
    })

    it('should deregister a contract successfully', async () => {
      const expectedRequestData = contractregistry.DeregisterContractRequest.encode({
        contractId: {
          name: mockContractName,
          tag: mockTag
        }
      }).finish()

      await contractRegistry.deregister(mockContractName, mockTag)

      expectUnaryRequest('DeregisterContract', expectedRequestData)
    })
  })

  describe('deleteArtifact', () => {
    beforeEach(() => {
      mockUnaryRequest(contractregistry.DeleteArtifactResponse.encode({}).finish())
    })

    it('should delete artifacts of a contract successfully', async () => {
      const mockBytecodeHash = '0xfefe'
      const expectedRequestData = contractregistry.DeleteArtifactRequest.encode({
        bytecodeHash: utils.arrayify(mockBytecodeHash)
      }).finish()

      await contractRegistry.deleteArtifact(mockBytecodeHash)

      expectUnaryRequest('DeleteArtifact', expectedRequestData)
    })
  })

  describe('getCatalog', () => {
    const mockNames = ['contract1', 'contract2']

    beforeEach(() => {
      mockUnaryRequest(contractregistry.GetCatalogResponse.encode({ names: mockNames }).finish())
    })

    it('should get a list of all contract names successfully', async () => {
      const expectedRequestData = contractregistry.GetCatalogRequest.encode({}).finish()

      const catalog = await contractRegistry.getCatalog()

      expectUnaryRequest('GetCatalog', expectedRequestData)
      expect(catalog).toEqual(mockNames)
    })
  })

  describe('get', () => {
    beforeEach(() => {
      mockUnaryRequest(
        contractregistry.GetContractResponse.encode({
          contract: {
            abi: Buffer.from(JSON.stringify(mockABI)),
            bytecode: utils.arrayify(mockBytecode),
            deployedBytecode: utils.arrayify(mockDeployedBytecode),
            id: {
              name: mockContractName,
              tag: mockTag
            }
          }
        }).finish()
      )
    })

    it('should get a contract successfully', async () => {
      const expectedRequestData = contractregistry.GetContractRequest.encode({
        contractId: {
          name: mockContractName,
          tag: mockTag
        }
      }).finish()

      const contract = await contractRegistry.get(mockContractName, mockTag)

      expectUnaryRequest('GetContract', expectedRequestData)
      expect(contract).toEqual({
        name: mockContractName,
        tag: mockTag,
        abi: mockABI,
        bytecode: mockBytecode,
        deployedBytecode: mockDeployedBytecode
      })
    })
  })

  describe('getABI', () => {
    beforeEach(() => {
      mockUnaryRequest(
        contractregistry.GetContractABIResponse.encode({
          abi: Buffer.from(JSON.stringify(mockABI))
        }).finish()
      )
    })

    it('should get a contract ABI successfully', async () => {
      const expectedRequestData = contractregistry.GetContractRequest.encode({
        contractId: {
          name: mockContractName,
          tag: mockTag
        }
      }).finish()

      const abi = await contractRegistry.getABI(mockContractName, mockTag)

      expectUnaryRequest('GetContractABI', expectedRequestData)
      expect(abi).toEqual(mockABI)
    })
  })

  describe('getBytecode', () => {
    beforeEach(() => {
      mockUnaryRequest(
        contractregistry.GetContractBytecodeResponse.encode({
          bytecode: utils.arrayify(mockBytecode)
        }).finish()
      )
    })

    it('should get a contract bytecode successfully', async () => {
      const expectedRequestData = contractregistry.GetContractRequest.encode({
        contractId: {
          name: mockContractName,
          tag: mockTag
        }
      }).finish()

      const bytecode = await contractRegistry.getBytecode(mockContractName, mockTag)

      expectUnaryRequest('GetContractBytecode', expectedRequestData)
      expect(bytecode).toEqual(mockBytecode)
    })
  })

  describe('getDeployedBytecode', () => {
    beforeEach(() => {
      mockUnaryRequest(
        contractregistry.GetContractDeployedBytecodeResponse.encode({
          deployedBytecode: utils.arrayify(mockDeployedBytecode)
        }).finish()
      )
    })

    it('should get a contract deployed bytecode successfully', async () => {
      const expectedRequestData = contractregistry.GetContractRequest.encode({
        contractId: {
          name: mockContractName,
          tag: mockTag
        }
      }).finish()

      const bytecode = await contractRegistry.getDeployedBytecode(mockContractName, mockTag)

      expectUnaryRequest('GetContractDeployedBytecode', expectedRequestData)
      expect(bytecode).toEqual(mockDeployedBytecode)
    })
  })

  describe('getTags', () => {
    const mockTags = ['tag1', 'tag2']

    beforeEach(() => {
      mockUnaryRequest(
        contractregistry.GetTagsResponse.encode({
          tags: mockTags
        }).finish()
      )
    })

    it('should get a contract tags successfully', async () => {
      const expectedRequestData = contractregistry.GetTagsRequest.encode({
        name: mockContractName
      }).finish()

      const tags = await contractRegistry.getTags(mockContractName)

      expectUnaryRequest('GetTags', expectedRequestData)
      expect(tags).toEqual(mockTags)
    })
  })

  const mockUnaryRequest = (data: Uint8Array) => {
    mockRPCClient.makeUnaryRequest = jest
      .fn()
      .mockImplementationOnce((method: any, serialize: any, deserialize: any, requestData, callback: any) => {
        callback(undefined, data)
      })
  }

  const expectUnaryRequest = (methodName: string, expectedRequestData?: Uint8Array) => {
    expect(mockRPCClient.makeUnaryRequest).toHaveBeenCalledWith(
      `contractregistry.ContractRegistry/${methodName}`,
      expect.any(Function),
      expect.any(Function),
      expectedRequestData,
      expect.any(Function)
    )
  }
})
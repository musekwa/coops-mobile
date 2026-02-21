
export class ApiClient {
    private readonly baseUrl: string;
    private readonly headers: any;
  constructor(baseUrl: string) {
    console.log('ApiClient constructor')
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    //   'Authorization': `Bearer ${token}`
    }
  }

  async update(data: any): Promise<void>{
    const response = await fetch(`${this.baseUrl}/upload_data`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        throw new Error(`Failed to update data: ${response.statusText}`)
    }
    if (response.status !== 200) {
        throw new Error(`Failed to update data: ${response.statusText}`)
    }   
  }

  async upsert(data: any): Promise<void>{
    try {
      const requestBody = JSON.stringify(data)
      console.log(`ApiClient upsert: ${data.table}`, { 
        table: data.table, 
        dataId: data.data?.id,
        dataKeys: data.data ? Object.keys(data.data) : []
      })
      
      const response = await fetch(`${this.baseUrl}/upsert_data`, {
          method: 'PUT',
          headers: this.headers,
          body: requestBody
      })
      
      if (!response.ok) {
        // Try to read the response body for error details
        let errorMessage = response.statusText || `HTTP ${response.status}`
        try {
          const errorBody = await response.text()
          if (errorBody) {
            try {
              const errorJson = JSON.parse(errorBody)
              errorMessage = errorJson.message || errorJson.error || errorBody
            } catch {
              errorMessage = errorBody
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use status text
          console.warn('Could not parse error response:', parseError)
        }
        
        throw new Error(`Failed to upsert data: ${errorMessage} (Status: ${response.status})`)
      }
      
      if (response.status !== 200) {
        throw new Error(`Failed to upsert data: Unexpected status ${response.status}`)
      }
    } catch (error: any) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Failed to upsert data: Network error - ${error.message}`)
      }
      // Re-throw if it's already our formatted error
      if (error.message && error.message.includes('Failed to upsert data')) {
        throw error
      }
      // Otherwise, wrap the error
      throw new Error(`Failed to upsert data: ${error.message || error.toString()}`)
    }
  }

  async delete(data: any): Promise<void>{
    const response = await fetch(`${this.baseUrl}/delete_data`, {
        method: 'DELETE',
        headers: this.headers,
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        throw new Error(`Failed to delete data: ${response.statusText}`)
    }
    if (response.status !== 200) {
        throw new Error(`Failed to delete data: ${response.statusText}`)
    }
  }
}


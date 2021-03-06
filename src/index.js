import axios from 'axios'

export class OnlineStorage {
  constructor () {
    // Server address onlineStorage
    this.host = 'https://storage.hazratgs.com'

    // Token for access to the storage
    this.token = null

    // Property to update token
    this.refreshToken = null

    // Password for making changes to the storage
    this.password = null
  }

  // Method for setting parameters
  config ({ host = 'https://storage.hazratgs.com', token = null, password = null } = {}) {
    if (host) this.host = host
    if (token) this.token = token
    if (password) this.password = password
  }

  // Server address with a token
  url () {
    return `${this.host}/${this.token}`
  }

  // Method for verifying the correctness of the token
  checkingToken () {
    if (!this.token) throw new Error('Token not specified')
  }

  // Headers
  headers () {
    const headers = {}
    // Set password
    if (this.password) headers.password = this.password

    return headers
  }

  // Creating a token
  async create ({ domains = null, backup = null, password = null } = {}) {
    try {
      // Request to create a token
      const response = await axios.post(`${this.host}/create`, {
        domains: domains,
        backup: backup,
        password: password
      })

      // In case of error forming a token
      if (!response.data.status) throw new Error(response.data.description)

      // Сохраняем пароль, для внесения изменений
      if (password) this.password = password

      // Save the token to gain access to the repository
      this.token = response.data.data.token

      // Set refreshToken
      this.refreshToken = response.data.data.refreshToken

      return response
    } catch (e) {
      return e
    }
  }

  // Update token
  async updateToken () {
    try {
      this.checkingToken()
      const response = await axios.post(`${this.url()}/refresh`, { refreshToken: this.refreshToken })

      // Update token
      this.token = response.data.data

      return response
    } catch (e) {
      return e
    }
  }

  // Method for obtaining value by key
  async get (key = '') {
    try {
      this.checkingToken()
      const response = await axios.get(`${this.url()}/${key}`)

      return response.data.data
    } catch (e) {
      return e
    }
  }

  // Writing data to the repository
  async set (data = {}) {
    try {
      this.checkingToken()
      const response = await axios.post(`${this.url()}`, data, {
        headers: this.headers()
      })

      // Data was not received
      if (!response.data.status) throw new Error(response.data.description)

      return response.data.data
    } catch (e) {
      return e
    }
  }

  // Deleting a property from the storage
  async remove (key) {
    try {
      this.checkingToken()
      const response = await axios.delete(`${this.url()}/${key}`, {
        headers: this.headers()
      })

      return response.data.status
    } catch (e) {
      return e
    }
  }

  // Cleaning storage
  async delete () {
    try {
      this.checkingToken()
      const response = await axios.delete(`${this.url()}`, {
        headers: this.headers()
      })

      return response.data.status
    } catch (e) {
      return e
    }
  }

  // Create backup
  async backup () {
    try {
      this.checkingToken()
      const response = await axios.post(`${this.url()}/backup`, {
        headers: this.headers()
      })

      return response.data.data
    } catch (e) {
      return e
    }
  }

  // We get the list of backup copies
  async backupList () {
    try {
      this.checkingToken()
      const response = await axios.get(`${this.url()}/backup/list`, {
        headers: this.headers()
      })

      return response.data.data
    } catch (e) {
      return e
    }
  }

  // Restoring the vault from a backup
  async backupRestore (key) {
    try {
      this.checkingToken()
      const response = await axios.post(`${this.url()}/backup/${key}`, {
        headers: this.headers()
      })

      return response.data.data
    } catch (e) {
      return e
    }
  }
}

const onlineStorage = new OnlineStorage()
export default onlineStorage

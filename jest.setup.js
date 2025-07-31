/* eslint-disable @typescript-eslint/no-require-imports */
require('@testing-library/jest-dom')

// Import types for jest-dom matchers
require('./src/types/jest-dom.d.ts')

// Mock dayjs locale
jest.mock('dayjs/locale/fr', () => ({}))

// Polyfill pour Request dans l'environnement de test
global.Request =
  global.Request ||
  class Request {
    constructor(input, init) {
      this.url = input
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers)
      this.body = init?.body
    }
  }

// Polyfill pour Response
global.Response =
  global.Response ||
  class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || 'OK'
      this.headers = new Headers(init?.headers)
      this.ok = this.status >= 200 && this.status < 300
    }

    async json() {
      return JSON.parse(this.body)
    }

    async text() {
      return this.body
    }
  }

// Polyfill pour Headers
global.Headers =
  global.Headers ||
  class Headers {
    constructor(init) {
      this.map = new Map()
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value))
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value))
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value))
        }
      }
    }

    set(key, value) {
      this.map.set(key.toLowerCase(), value)
    }

    get(key) {
      return this.map.get(key.toLowerCase())
    }

    has(key) {
      return this.map.has(key.toLowerCase())
    }

    forEach(callback) {
      this.map.forEach((value, key) => callback(value, key, this))
    }
  }

// import { server } from './src/mocks/server'

// Établir les intercepteurs d'API avant tous les tests
// beforeAll(() => server.listen())

// Réinitialiser les handlers après chaque test
// afterEach(() => server.resetHandlers())

// Nettoyer après tous les tests
// afterAll(() => server.close())

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

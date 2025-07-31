import { http, HttpResponse } from 'msw'

// Types pour les données mock
interface CompanyData {
  name: string
  logoUrl?: string
  annualLeaveDays: number
}

interface LeaveData {
  startDate: string
  endDate: string
  type: string
  reason?: string
}

interface InviteData {
  email: string
  role: string
}

interface AuthData {
  email: string
  password: string
  name?: string
}

// Données de test
const mockCompanies = [
  {
    id: 'company-1',
    name: 'Test Company 1',
    logoUrl: 'https://example.com/logo1.png',
    annualLeaveDays: 25,
    userMembershipId: 'membership-1',
    userRole: 'MANAGER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'company-2',
    name: 'Test Company 2',
    logoUrl: 'https://example.com/logo2.png',
    annualLeaveDays: 30,
    userMembershipId: 'membership-2',
    userRole: 'EMPLOYEE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockLeaves = [
  {
    id: 'leave-1',
    startDate: '2024-06-10T00:00:00.000Z',
    endDate: '2024-06-12T00:00:00.000Z',
    type: 'ANNUAL',
    status: 'APPROVED',
    membership: {
      user: {
        name: 'John Doe',
      },
    },
  },
  {
    id: 'leave-2',
    startDate: '2024-06-15T00:00:00.000Z',
    endDate: '2024-06-15T00:00:00.000Z',
    type: 'SICK',
    status: 'PENDING',
    membership: {
      user: {
        name: 'Jane Smith',
      },
    },
  },
]

const mockMemberships = [
  {
    id: 'membership-1',
    userId: 'user-1',
    companyId: 'company-1',
    role: 'MANAGER',
    active: true,
    user: {
      id: 'user-1',
      name: 'John Manager',
      email: 'john@example.com',
    },
  },
  {
    id: 'membership-2',
    userId: 'user-2',
    companyId: 'company-1',
    role: 'EMPLOYEE',
    active: true,
    user: {
      id: 'user-2',
      name: 'Jane Employee',
      email: 'jane@example.com',
    },
  },
]

export const handlers = [
  // Companies endpoints
  http.get('/api/companies', () => {
    return HttpResponse.json(mockCompanies)
  }),

  http.get('/api/companies/:id', ({ params }) => {
    const company = mockCompanies.find(c => c.id === params.id)
    if (!company) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(company)
  }),

  http.post('/api/companies', async ({ request }) => {
    const newCompany = (await request.json()) as CompanyData
    const company = {
      id: `company-${Date.now()}`,
      ...newCompany,
      userMembershipId: `membership-${Date.now()}`,
      userRole: 'MANAGER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(company, { status: 201 })
  }),

  http.put('/api/companies/:id', async ({ params, request }) => {
    const updates = (await request.json()) as Partial<CompanyData>
    const company = mockCompanies.find(c => c.id === params.id)
    if (!company) {
      return new HttpResponse(null, { status: 404 })
    }
    const updatedCompany = {
      ...company,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(updatedCompany)
  }),

  http.delete('/api/companies/:id', ({ params }) => {
    const company = mockCompanies.find(c => c.id === params.id)
    if (!company) {
      return new HttpResponse(null, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // Leaves endpoints
  http.get('/api/leaves', () => {
    return HttpResponse.json(mockLeaves)
  }),

  http.get('/api/leaves/calendar', ({ request }) => {
    const url = new URL(request.url)
    const _companyId = url.searchParams.get('companyId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Filtrer les congés selon les paramètres
    let filteredLeaves = mockLeaves
    if (startDate && endDate) {
      filteredLeaves = mockLeaves.filter(leave => {
        const leaveStart = new Date(leave.startDate)
        const leaveEnd = new Date(leave.endDate)
        const filterStart = new Date(startDate)
        const filterEnd = new Date(endDate)

        return (
          (leaveStart >= filterStart && leaveStart <= filterEnd) ||
          (leaveEnd >= filterStart && leaveEnd <= filterEnd) ||
          (leaveStart <= filterStart && leaveEnd >= filterEnd)
        )
      })
    }

    return HttpResponse.json(filteredLeaves)
  }),

  http.post('/api/leaves', async ({ request }) => {
    const newLeave = (await request.json()) as LeaveData
    const leave = {
      id: `leave-${Date.now()}`,
      ...newLeave,
      status: 'PENDING',
      membership: {
        user: {
          name: 'Test User',
        },
      },
    }
    return HttpResponse.json(leave, { status: 201 })
  }),

  // Memberships endpoints
  http.get('/api/memberships', () => {
    return HttpResponse.json(mockMemberships)
  }),

  http.post('/api/memberships/invite', async ({ request }) => {
    const invitation = (await request.json()) as InviteData
    const membership = {
      id: `membership-${Date.now()}`,
      ...invitation,
      active: false,
      user: {
        id: `user-${Date.now()}`,
        name: 'Invited User',
        email: invitation.email,
      },
    }
    return HttpResponse.json(membership, { status: 201 })
  }),

  // Auth endpoints
  http.post('/api/auth/signin', async ({ request }) => {
    const credentials = (await request.json()) as AuthData
    if (
      credentials.email === 'test@example.com' &&
      credentials.password === 'password'
    ) {
      return HttpResponse.json({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
        session: {
          id: 'session-1',
          token: 'mock-token',
        },
      })
    }
    return new HttpResponse(null, { status: 401 })
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const userData = (await request.json()) as AuthData
    const user = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json(user, { status: 201 })
  }),

  // Error handlers for testing error states
  http.get('/api/companies/error', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get('/api/leaves/error', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }),
]

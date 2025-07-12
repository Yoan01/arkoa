'use client'
import React from 'react'

import { useGetLeaves } from '@/hooks/api/leaves/get-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

import { DataTable } from '../ui/data-table'
import { leaveColumns } from './leave-columns'

export function LeaveDataTable() {
  const { activeCompany } = useCompanyStore()
  const { data } = useGetLeaves({
    companyId: activeCompany?.id ?? '',
    membershipId: activeCompany?.userMembershipId ?? '',
  })

  return <DataTable columns={leaveColumns} data={data ?? []} />
}

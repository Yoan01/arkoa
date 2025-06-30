import {
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon,
} from 'lucide-react'

export const appSidebarNav = [
  {
    title: 'Dashboard',
    url: '#',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Lifecycle',
    url: '#',
    icon: ListIcon,
  },
  {
    title: 'Analytics',
    url: '#',
    icon: BarChartIcon,
  },
  {
    title: 'Projects',
    url: '#',
    icon: FolderIcon,
  },
  {
    title: 'Team',
    url: '#',
    icon: UsersIcon,
  },
]

export const appSidebarDocs = [
  {
    name: 'Data Library',
    url: '#',
    icon: DatabaseIcon,
  },
  {
    name: 'Reports',
    url: '#',
    icon: ClipboardListIcon,
  },
  {
    name: 'Word Assistant',
    url: '#',
    icon: FileIcon,
  },
]

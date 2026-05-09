import { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'

import DrawerScreen from '@/components/DrawerScreen'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { GetActiveClothGroupedByCustomer } from '@/db/helpers'

type ActiveClothRecord = {
  id: number
  customer_id: number
  customer_name: string
  title: string
  status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue'
  due_date: string | null
}

const STATUS_COLORS: Record<ActiveClothRecord['status'], { bg: string; text: string }> = {
  untouched: { bg: '#E5E7EB', text: '#374151' },
  cut: Colors.status.cut,
  sewn: Colors.status.sewn,
  ready: Colors.status.ready,
  overdue: Colors.status.overdue,
}

export default function Queue() {
  const [jobs, setJobs] = useState<ActiveClothRecord[]>([])
  const [search, setSearch] = useState('')

  const loadJobs = useCallback(() => {
    setJobs((GetActiveClothGroupedByCustomer() as ActiveClothRecord[]) ?? [])
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadJobs()
    }, [loadJobs])
  )

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return jobs
    }

    return jobs.filter((job) =>
      [job.title, job.customer_name, job.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [jobs, search])

  const overdueCount = filteredJobs.filter((job) => job.status === 'overdue').length

  return (
    <DrawerScreen
      title='Queue'
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder='Search jobs or customers...'
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{filteredJobs.length}</Text>
          <Text style={styles.summaryLabel}>Active jobs</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{overdueCount}</Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
      </View>

      {filteredJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {jobs.length === 0 ? 'No active jobs yet' : 'No matches found'}
          </Text>
          <Text style={styles.emptyBody}>
            {jobs.length === 0
              ? 'Cloth jobs that are still in progress will show up here.'
              : 'Try a different customer name, job title, or status.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filteredJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/(drawer)/cloths/${job.id}`)}
            >
              <View style={styles.jobText}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.customerName}>{job.customer_name}</Text>
                <Text style={styles.jobMeta}>
                  Due {job.due_date ? formatDate(job.due_date) : 'not set'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: STATUS_COLORS[job.status].bg },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[job.status].text },
                  ]}
                >
                  {capitalize(job.status)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </DrawerScreen>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  summaryNumber: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.brand.text,
  },
  summaryLabel: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.brand.text,
  },
  emptyBody: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  jobText: {
    flex: 1,
    gap: Spacing.xs,
  },
  jobTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.brand.text,
  },
  customerName: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  jobMeta: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.72)',
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 16,
  },
})

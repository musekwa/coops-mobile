import React from 'react'
import { Stack } from 'expo-router'

export default function UserLayout() {
  return (
    <Stack>
        <Stack.Screen 
            name="schedule-monitoring"
            options={{
                headerShown: false,
            }}
        />
    </Stack>
  )
}
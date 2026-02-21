
import React from 'react'
import { FAB } from 'react-native-paper'
import { colors } from 'src/constants'
import { Href, useRouter } from 'expo-router'

type SingleFloatingButtonProps = {
route?: Href
icon?: string
}

export default function SingleFloatingButton({ route, icon }: SingleFloatingButtonProps) {
  const router = useRouter()
  return (
    <FAB
    style={[
        {
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: colors.primary
        },
        // fabStyle,
    ]}
    color={colors.white}
    small={false}		

    icon={icon ? icon : "plus"}
    onPress={() => route ? router.push(route as Href) : router.back()}
    />
  )
}
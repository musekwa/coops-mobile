
import { View, Text } from 'react-native'
import React from 'react'
import * as Animatable from 'react-native-animatable';


export default function Spinner() {
  return (
    <View className='absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center h-full bg-white dark:bg-black'>
      <Animatable.View 
        animation={"rotate"}
        easing={"ease-in-out"}
        iterationCount={"infinite"}
        className='border-t-2 border-r-2 border-b-2 border-[#008000] rounded-full h-8 w-8'
      />
    </View>
  )
}
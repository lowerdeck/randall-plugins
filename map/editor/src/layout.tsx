import { Stack, StackProps } from '@mui/joy'

export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction='row' alignItems='center' {...props}/>
}

export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction='column' {...props}/>
}

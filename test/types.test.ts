import { expectTypeOf, it } from 'vitest'
import type { UseQueryReturnType, UseMutationReturnType } from '@tanstack/vue-query'
import { createHttpClient, useGet, useSend, type ApiError, type RequestSpec } from '../src/index'

interface User { id: number; name: string }
interface Change { id: number; data: { name: string } }

it('preserves response, selected data, error and variable types', () => {
  // Type assertions are compile-time checks; these composables are not invoked outside setup.
  type Get = ReturnType<typeof useGet<User, ApiError, string>>
  type Send = ReturnType<typeof useSend<User, Change>>
  expectTypeOf<Get>().toExtend<UseQueryReturnType<string, ApiError>>()
  expectTypeOf<Send>().toExtend<UseMutationReturnType<User, ApiError, Change, unknown>>()
  expectTypeOf<Parameters<ReturnType<typeof createHttpClient>['request']>[0]>().toExtend<RequestSpec>()
})

function typeExamples() {
  const query = useGet<User, ApiError, string>({ url: '/users/:id', path: () => ({ id: 1 }), options: { select: user => user.name } })
  expectTypeOf(query.data.value).toEqualTypeOf<string | undefined>()
  const mutation = useSend<User, Change>({ method: 'PATCH', url: '/users/:id', path: vars => ({ id: vars.id }), body: vars => vars.data })
  mutation.mutate({ id: 1, data: { name: 'Ada' } })
  const legacy = useSend<User, Change>({ method: 'PATCH', url: '/users/1', bodyRef: { id: 1, data: { name: 'Ada' } } })
  legacy.mutate()
  // @ts-expect-error invalid method
  useSend<User, Change>({ method: 'HEAD', url: '/users' })
  // @ts-expect-error invalid query value
  useGet<User>({ url: '/users', query: { nested: { id: 1 } } })
  // @ts-expect-error path mapper receives typed variables
  useSend<User, Change>({ method: 'PATCH', url: '/users/:id', path: vars => ({ id: vars.missing }) })
}
void typeExamples

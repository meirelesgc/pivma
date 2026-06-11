import { useQuery, useMutation } from '@tanstack/react-query'
import * as formApi from '../api/forms'

export function useFormDetails(form_id) {
  return useQuery({
    queryKey: ['form', form_id],
    queryFn: () => formApi.getFormDetails(form_id),
    enabled: !!form_id
  })
}

export function useSubmitFormResponse() {
  return useMutation({
    mutationFn: (data) => formApi.submitFormResponse(data)
  })
}

export function useFormResponses(processId) {
  return useQuery({
    queryKey: ['formResponses', processId],
    queryFn: () => formApi.getResponsesByProcess(processId),
    enabled: !!processId
  })
}


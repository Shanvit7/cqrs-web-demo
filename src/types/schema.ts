import { z } from 'zod'

export const formSchema = z.object({
  video: z
    .custom<File>((val) => val !== null && val instanceof File, { message: 'Please upload a video file' })
    .refine(
      (file) => file.type.startsWith('video/'),
      { message: 'File must be a video' }
    )
    .refine(
      (file) => file.size <= 100 * 1024 * 1024, // 100MB
      { message: 'Video file must be less than 100MB' }
    ),
  githubUrl: z
    .url({ message: 'Please enter a valid URL' })
    .min(1, { message: 'GitHub URL is required' })
    .refine(
      (url) => url.includes('github.com'),
      { message: 'URL must be a GitHub URL' }
    ),
  testcase: z
    .string()
    .min(1, { message: 'Test case is required' })
    .min(10, { message: 'Test case must be at least 10 characters' }),
})

export type FormValues = {
  video: File | null
  githubUrl: string
  testcase: string
}


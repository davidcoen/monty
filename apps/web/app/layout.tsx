export const metadata = {
  title: 'Monty',
  description: 'Scenario planning prototype',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

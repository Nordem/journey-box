import RegistrationWizard from "@/components/registration-wizard"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
      <RegistrationWizard />
    </main>
  )
}


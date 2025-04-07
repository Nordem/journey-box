import RegistrationWizard from "@/components/registration-wizard"

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <RegistrationWizard />
      </div>
    </main>
  )
}


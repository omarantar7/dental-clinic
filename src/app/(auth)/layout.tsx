import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="grid w-full grid-cols-1 overflow-hidden shadow-sm lg:grid-cols-2">
        <div className="relative hidden min-h-150 lg:block  bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5),rgba(0,0,0,0.8)),url('https://thearchitectsdiary.com/wp-content/uploads/2024/12/modern-dental-clinic-2.jpg')] bg-cover bg-center">

          <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 backdrop-blur-sm">
            <Image src="/dentalLogo.png" alt="" width={24} height={24} />

            <span className="text-sm font-semibold tracking-wide text-foreground">
              Dental Clinic
            </span>
          </div>

          <div className="absolute bottom-10 left-8 right-8 text-white">
            <h2 className="text-3xl font-semibold leading-tight">
              Caring for Your Smile,
              <br />
              One Visit at a Time
            </h2>
          </div>
        </div>

        <div className="flex flex-col justify-center px-8 py-16 sm:px-16">
          <div className="w-full max-w-100 mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

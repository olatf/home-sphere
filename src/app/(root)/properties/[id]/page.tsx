export default function PropertyDetailsLayout() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto grid gap-16 px-6 lg:grid-cols-3 lg:px-16">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-112.5 rounded-2xl bg-zinc-200" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 rounded-xl bg-zinc-100" />
            <div className="h-32 rounded-xl bg-zinc-100" />
            <div className="h-32 rounded-xl bg-zinc-100" />
          </div>

          <div>
            <h2 className="mt-10 mb-6 text-3xl font-bold">
              Property Description
            </h2>
            <p className="leading-relaxed text-zinc-600">
              This modern property offers spacious rooms, premium finishing and
              secure environment.
            </p>
          </div>
        </div>
        <div className="sticky top-24 h-fit rounded-2xl bg-zinc-50 p-8 shadow">
          <h3 className="mb-4 text-2xl font-bold">₦120,000,000</h3>

          <p className="mb-6 text-zinc-600">Lekki, Lagos</p>

          <button className="w-full rounded-xl bg-zinc-900 py-3 text-white transition hover:bg-zinc-800">
            Contact Agent
          </button>
        </div>
      </div>
    </section>
  );
}

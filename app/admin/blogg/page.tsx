import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { AddPostForm } from "./add-post-form";
import { PostRow } from "./post-row";

export default async function BlogPage() {
  const businessId = await requireBusinessId();
  const list = await db.query.posts.findMany({
    where: eq(posts.businessId, businessId),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Blogg</h1>
        <p className="text-sm text-gray-500">
          Skriv innlegg og oppdateringer. Hvert innlegg får sin egen side —
          bra for synlighet i Google. Slå på «Vis blogg på siden» under Min
          side for å vise dem.
        </p>
      </div>

      <AddPostForm />

      <div className="space-y-3">
        <h2 className="font-semibold">
          Innlegg <span className="text-gray-400">({list.length})</span>
        </h2>
        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Ingen innlegg ennå. Skriv det første over.
          </p>
        ) : (
          list.map((post) => <PostRow key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

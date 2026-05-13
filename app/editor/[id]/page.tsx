import { EditorScreen } from "@/components/editor/EditorScreen";

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;

  return <EditorScreen documentId={id} />;
}

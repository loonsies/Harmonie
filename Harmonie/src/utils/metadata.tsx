interface Props {
  title: string;
}

export default function Metadata({ title }: Props) {
  return (
    <>
      <title>{`${title} | Harmonie`}</title>
      <meta name="description" content={'FFXIV Bard Repository'} />
    </>
  );
}
interface Props {
  title: string;
  content: string;
}

export default function Alert({ title, content }: Props) {
  return (
    <div className="rounded-md bg-yellow-50 p-4 my-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">{title}</h3>
          <div className="mt-2 text-sm text-yellow-700">{content}</div>
        </div>
      </div>
    </div>
  );
}

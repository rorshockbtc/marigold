import { redirect } from 'next/navigation';

export default function OldApiExplorerRedirect() {
  redirect('/developers/docs/api-reference/detect');
}

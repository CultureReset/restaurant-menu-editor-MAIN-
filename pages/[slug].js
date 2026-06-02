import MenuEditor from './index';

export default function SlugPage() {
  return <MenuEditor />;
}

export async function getServerSideProps() {
  return { props: {} };
}

import Composer from './components/PostComposer/Composer';

export default function App() {
  return (
    <div className="app-container">
      <main className="main-content" style={{ marginLeft: 0, padding: '2rem 5%' }}>
        <Composer />
      </main>
    </div>
  );
}

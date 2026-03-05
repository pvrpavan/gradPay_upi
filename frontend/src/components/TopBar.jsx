import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TopBar({ title, showBack = true, rightElement = null }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[#f65e1d] text-white rounded-t-lg shadow-sm">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="bg-transparent border-none text-white cursor-pointer p-1">
            <ArrowLeft size={22} />
          </button>
        )}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  );
}

// src/components/ui/Dialog.jsx

export function Dialog({ children, ...props }) {
  return (
    <div className="dialog-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50" {...props}>
      {children}
    </div>
  );
}

export function DialogContent({ children, ...props }) {
  return (
    <div className="dialog-content bg-white rounded-xl p-6 shadow-lg max-w-md w-full" {...props}>
      {children}
    </div>
  );
}

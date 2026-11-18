export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const v = { primary: 'bg-blue-600 text-white hover:bg-blue-700', secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200', danger: 'bg-red-600 text-white hover:bg-red-700' };
  return <button className={'px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ' + (v[variant]||v.primary) + ' ' + className} {...props}>{children}</button>;
}

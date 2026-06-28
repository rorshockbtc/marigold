export default function MockLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Mock Elly Login</h1>
        <form>
          <div className="mb-4">
            <label htmlFor="user_email_login" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" id="user_email_login" name="email" className="mt-1 block w-full border border-gray-300 rounded p-2" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" className="mt-1 block w-full border border-gray-300 rounded p-2" />
          </div>
          <button type="submit" id="btn-login" className="w-full bg-blue-600 text-white p-2 rounded">Log In</button>
        </form>
      </div>
    </div>
  );
}

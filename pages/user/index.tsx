import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Clerk from "@clerk/clerk-js";
import { authManager, userManager } from "../../tina/auth";

// This page will be integrated into TinaCMS

export default function UserPage(props: { users }) {
  const router = useRouter();
  const handleAddUser = async (event) => {
    event.preventDefault()
    const res = await fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify({ op: 'add', user }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (res.status === 200) {
      setStatus('idle')
    } else {
      setStatus('error')
    }
    await router.replace(router.asPath)
  }

  const handleDeleteUser = async (event) => {
    event.preventDefault()
    const res = await fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify({ op: 'delete', user }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (res.status === 200) {
      setStatus('idle')
    } else {
      setStatus('error')
    }
    await router.replace(router.asPath)
  }

  const handleEmailUpdated = (event) => {
    setUser({
      email: event.target.value,
      id: user.id,
    })
  }

  // workaround to keep the jwt refreshed
  useEffect(() => {(new Clerk(process.env.NEXT_PUBLIC_CLERK_PUBLIC_KEY)).load().catch((e) => console.log(e))}, []);

  const [user, setUser] = React.useState({ email: '', id: '' })
  const [status, setStatus] = React.useState<'idle' | 'add' | 'delete' | 'error'>('idle')
  if (status === 'add') {
    return (
      <div>
        <h1>Add User</h1>
        <div>
          <label>
            Email:
            <div style={{border: '1px solid black', padding: '1px', margin: '1px'}}>
              <input type="text" name="username" onChange={handleEmailUpdated} value={user.email} style={{width: '100%'}}/>
            </div>
          </label>
          <button onClick={(e) => handleAddUser(e)}>Save</button>
        </div>
      </div>
    )
  } else if (status === 'delete') {
    return (
      <div>
        <h1>Delete User?</h1>
        <div>
          <button onClick={() => setStatus('idle')}>Cancel</button>
          <button onClick={(e) => handleDeleteUser(e) }>Delete</button>
        </div>
      </div>
    )
  } else if (status === 'error') {
    return (
      <div>
        <h1>Error</h1>
      </div>
    )
  }
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {props.users?.map((user) => (
          <li key={user.id}>
            {user.email} |  <button onClick={(e) => { setUser(user); setStatus('delete') }}>Remove</button>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={() => { setUser({ email: '', id: '' }); setStatus('add')}}>Add User</button>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext)  {
  const authenticated = await authManager.isAuthenticated(context.req, context.res)
  if (!authenticated) {
    return {
      redirect: {
        destination: '/admin/index.html',
        permanent: false
      }
    }
  }
  const authorized = await authManager.isAuthorized(context.req, context.res)
  let users = []
  if (authorized) {
    users = await userManager.listUsers()
  }
  return { props: { users }}
}

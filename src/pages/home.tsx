import { getDatabase, onValue, ref, set } from "firebase/database"
import { useState } from "react"

export default function Home() {
  const [totalUsers, setTotalUsers] = useState(0)

  function usersCount() {
    var users = 0
    const db = getDatabase()
    const dbRef = ref(db, "users")

    onValue(dbRef, snapshots => {
      users = Object.keys(snapshots.val()).length
    })

    return users
  }

  return (
    <>
      <main>
        <div className="list-user">
          <span>Usuários</span>
          <q>{usersCount()}</q>
        </div>
      </main>
    </>
  )
}
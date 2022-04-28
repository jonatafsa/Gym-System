import { getDatabase, onValue, ref, set } from "firebase/database"
import { useEffect, useState } from "react"

export default function Home() {
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db, "users")

    onValue(dbRef, snapshots => {
      setTotalUsers(Object.keys(snapshots.val()).length)
    })
  }, [])

  return (
    <>
      <main>
        <div className="list-user">
          <span>Usuários</span>
          <q>{totalUsers}</q>
        </div>
      </main>
    </>
  )
}
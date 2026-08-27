import { Title } from '@solidjs/meta'
import { Loading } from 'solid-js'

import './styles/app.css'
import { Router } from './router'

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>Notes</Title>
          <Loading fallback={<main>Loading…</main>}>{props.children}</Loading>
        </>
      )}
    </Router>
  )
}

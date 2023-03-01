import ConnectButtonWrapper from './connect-button'
import { Logo } from './Logo';

export default function Header({ position, setEditProfileLink, setProfileEditOpen }) {
  return (
    <header className={['header', [position && `header--${position}`]].join(' ')}>
      <Logo />
      <ConnectButtonWrapper setEditProfileLink={setEditProfileLink} setProfileEditOpen={setProfileEditOpen} />
    </header>
  )
}
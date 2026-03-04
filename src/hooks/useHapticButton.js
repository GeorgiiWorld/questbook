export function useHapticButton(onClick, delay = 1) {
  const handleClick = async (e) => {
    // Вибрация если поддерживается
    if (navigator.vibrate) navigator.vibrate(40)

    const button = e.currentTarget
    button.disabled = true
    button.classList.add('btn-pressed')

    await onClick()

    setTimeout(() => {
      button.disabled = false
      button.classList.remove('btn-pressed')
    }, delay)
  }

  return handleClick
}

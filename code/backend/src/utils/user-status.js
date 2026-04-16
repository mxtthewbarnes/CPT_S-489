export async function refreshUserStatus(user) {
  if (!user || user.status !== 'suspended' || !user.suspensionEndsAt) {
    return user;
  }

  if (new Date(user.suspensionEndsAt) > new Date()) {
    return user;
  }

  user.status = 'active';
  user.statusReason = null;
  user.statusNote = null;
  user.suspensionEndsAt = null;
  await user.save();

  return user;
}

export function buildStatusMessage(user) {
  if (user.status === 'banned') {
    return 'This account has been banned.';
  }

  if (user.status === 'suspended') {
    if (user.suspensionEndsAt) {
      return `This account is suspended until ${new Date(user.suspensionEndsAt).toLocaleString()}.`;
    }

    return 'This account is suspended.';
  }

  return null;
}

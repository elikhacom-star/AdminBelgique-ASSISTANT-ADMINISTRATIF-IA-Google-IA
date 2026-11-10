package com.adminbelgique.app.data

import com.adminbelgique.app.model.AppUser
import com.adminbelgique.app.model.RolePermissions
import com.adminbelgique.app.model.UserRole
import com.adminbelgique.app.model.permissions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AuthRepository {

    // Pre-seeded Belgian accounts for testing roles & permissions
    companion object {
        val PRESET_ADMIN = AppUser(
            uid = "admin-001",
            email = "admin@adminbelgique.com",
            displayName = "Marc Vandewalle (Super Admin)",
            role = UserRole.ADMIN,
            status = "active",
            company = "elikacces IT Solutions / AdminBelgique SPRL",
            bceNumber = "0842.123.456",
            createdAt = "15/01/2026",
            lastLoginAt = "Aujourd'hui à 17:30"
        )

        val PRESET_EDITOR = AppUser(
            uid = "editor-002",
            email = "redaction@adminbelgique.com",
            displayName = "Sophie De Smet (Éditrice Juridique)",
            role = UserRole.EDITOR,
            status = "active",
            company = "Cabinet Conseil Fiduciaire Bruxelles",
            bceNumber = "0712.987.654",
            createdAt = "20/03/2026",
            lastLoginAt = "Hier à 14:15"
        )

        val PRESET_VISITOR = AppUser(
            uid = "visitor-003",
            email = "visiteur.demo@gmail.com",
            displayName = "Lucas Peeters (Citoyen Visiteur)",
            role = UserRole.VISITOR,
            status = "active",
            company = "Citoyen Particulier",
            createdAt = "10/05/2026",
            lastLoginAt = "À l'instant"
        )
    }

    private val _currentUser = MutableStateFlow<AppUser?>(PRESET_ADMIN)
    val currentUser: StateFlow<AppUser?> = _currentUser.asStateFlow()

    val currentRole: UserRole
        get() = _currentUser.value?.role ?: UserRole.VISITOR

    val permissions: RolePermissions
        get() = currentRole.permissions()

    fun switchRole(newRole: UserRole) {
        when (newRole) {
            UserRole.ADMIN -> _currentUser.value = PRESET_ADMIN
            UserRole.EDITOR -> _currentUser.value = PRESET_EDITOR
            UserRole.VISITOR -> _currentUser.value = PRESET_VISITOR
        }
    }

    fun login(email: String): Boolean {
        return when (email.lowercase().trim()) {
            PRESET_ADMIN.email -> {
                _currentUser.value = PRESET_ADMIN
                true
            }
            PRESET_EDITOR.email -> {
                _currentUser.value = PRESET_EDITOR
                true
            }
            else -> {
                _currentUser.value = AppUser(
                    uid = "usr-${System.currentTimeMillis()}",
                    email = email,
                    displayName = email.substringBefore("@"),
                    role = UserRole.VISITOR,
                    createdAt = "Aujourd'hui",
                    lastLoginAt = "À l'instant"
                )
                true
            }
        }
    }

    fun register(email: String, displayName: String, role: UserRole = UserRole.VISITOR): Boolean {
        _currentUser.value = AppUser(
            uid = "usr-${System.currentTimeMillis()}",
            email = email,
            displayName = displayName.ifEmpty { email.substringBefore("@") },
            role = role,
            createdAt = "Aujourd'hui",
            lastLoginAt = "À l'instant"
        )
        return true
    }

    fun logout() {
        _currentUser.value = null
    }
}

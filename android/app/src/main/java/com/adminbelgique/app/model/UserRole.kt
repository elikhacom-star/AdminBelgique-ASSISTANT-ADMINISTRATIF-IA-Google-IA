package com.adminbelgique.app.model

import com.google.gson.annotations.SerializedName

enum class UserRole(
    val roleKey: String,
    val label: String,
    val description: String
) {
    @SerializedName("admin")
    ADMIN(
        roleKey = "admin",
        label = "Administrateur",
        description = "Accès total aux utilisateurs, contenus, paramètres système et journaux d'audit."
    ),

    @SerializedName("editor")
    EDITOR(
        roleKey = "editor",
        label = "Éditeur",
        description = "Création et modification des dossiers, baux, analyses et documents juridiques."
    ),

    @SerializedName("visitor")
    VISITOR(
        roleKey = "visitor",
        label = "Visiteur",
        description = "Accès en lecture seule. Visualisation des simulations et documents sans droit de modification."
    );

    companion object {
        fun fromKey(key: String): UserRole {
            return entries.firstOrNull { it.roleKey.equals(key, ignoreCase = true) } ?: VISITOR
        }
    }
}

data class RolePermissions(
    // Backend access
    val manageUsers: Boolean,
    val manageContent: Boolean,
    val manageSettings: Boolean,
    val viewAuditLogs: Boolean,

    // Frontend access
    val canViewAll: Boolean,
    val canCreateContent: Boolean,
    val canEditContent: Boolean,
    val canDeleteContent: Boolean
)

fun UserRole.permissions(): RolePermissions = when (this) {
    UserRole.ADMIN -> RolePermissions(
        manageUsers = true,
        manageContent = true,
        manageSettings = true,
        viewAuditLogs = true,
        canViewAll = true,
        canCreateContent = true,
        canEditContent = true,
        canDeleteContent = true
    )
    UserRole.EDITOR -> RolePermissions(
        manageUsers = false,
        manageContent = true,
        manageSettings = false,
        viewAuditLogs = false,
        canViewAll = true,
        canCreateContent = true,
        canEditContent = true,
        canDeleteContent = false
    )
    UserRole.VISITOR -> RolePermissions(
        manageUsers = false,
        manageContent = false,
        manageSettings = false,
        viewAuditLogs = false,
        canViewAll = true,
        canCreateContent = false,
        canEditContent = false,
        canDeleteContent = false
    )
}

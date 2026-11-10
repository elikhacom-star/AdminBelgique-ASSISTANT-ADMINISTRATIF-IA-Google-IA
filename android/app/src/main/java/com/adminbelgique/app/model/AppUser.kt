package com.adminbelgique.app.model

import com.google.gson.annotations.SerializedName

data class AppUser(
    @SerializedName("uid")
    val uid: String,

    @SerializedName("email")
    val email: String,

    @SerializedName("displayName")
    val displayName: String,

    @SerializedName("role")
    val role: UserRole,

    @SerializedName("status")
    val status: String = "active", // "active" | "suspended"

    @SerializedName("company")
    val company: String? = null,

    @SerializedName("bceNumber")
    val bceNumber: String? = null,

    @SerializedName("createdAt")
    val createdAt: String = "",

    @SerializedName("lastLoginAt")
    val lastLoginAt: String? = null
)

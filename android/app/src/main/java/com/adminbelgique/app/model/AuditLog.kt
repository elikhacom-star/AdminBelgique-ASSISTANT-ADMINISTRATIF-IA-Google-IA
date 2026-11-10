package com.adminbelgique.app.model

import com.google.gson.annotations.SerializedName

data class AuditLog(
    @SerializedName("id")
    val id: String,

    @SerializedName("timestamp")
    val timestamp: String,

    @SerializedName("actorEmail")
    val actorEmail: String,

    @SerializedName("actorRole")
    val actorRole: String,

    @SerializedName("action")
    val action: String,

    @SerializedName("details")
    val details: String,

    @SerializedName("targetUserEmail")
    val targetUserEmail: String? = null
)

package com.adminbelgique.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.adminbelgique.app.model.UserRole

@Composable
fun RoleBadge(
    role: UserRole,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor, borderColor) = when (role) {
        UserRole.ADMIN -> Triple(
            Color(0x33F59E0B), // Amber 20%
            Color(0xFFFCD34D), // Amber 300
            Color(0x66F59E0B)  // Amber 40%
        )
        UserRole.EDITOR -> Triple(
            Color(0x333B82F6), // Blue 20%
            Color(0xFF93C5FD), // Blue 300
            Color(0x663B82F6)  // Blue 40%
        )
        UserRole.VISITOR -> Triple(
            Color(0x44334155), // Slate 700
            Color(0xFFCBD5E1), // Slate 300
            Color(0x66475569)  // Slate 600
        )
    }

    Box(
        modifier = modifier
            .background(bgColor, RoundedCornerShape(8.dp))
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = role.label,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

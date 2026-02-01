# users/serializers.py
from rest_framework import serializers
from .models import SchoolClass

class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        # Expose all relevant fields
        fields = ['class_id', 'class_name', 'stream', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['class_id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically set the creator as the logged-in user
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)
